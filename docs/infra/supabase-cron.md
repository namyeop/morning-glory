# Supabase Cron 준비 가이드 (Docker 워크플로우)

Phase 3의 Nudge Engine MVP 구현을 위해 Supabase Cron으로 Edge Function을 정기 실행할 수 있도록 필요한 준비 사항과 절차를 정리했습니다. 공식 문서: [Supabase Cron 가이드](https://supabase.com/docs/guides/platform/cron), [pg_cron SQL 예시](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/cron/quickstart.mdx).

## 1. 사전 준비
- **Supabase 프로젝트**: 조직 혹은 개인 계정에 생성된 프로젝트와 `project-ref` 확인.
- **권한**: Cron과 Edge Function을 관리할 수 있는 Owner/ Maintainer 권한.
- **Docker 기반 CLI**: 로컬 설치 대신 공식 이미지 `supabase/cli`를 사용합니다. 릴리스 태그는 Supabase CLI 문서(<https://github.com/supabase/cli/blob/develop/README.md>)에서 확인하고, Cron 명령이 포함된 v1.166 이상을 권장합니다.
- **환경 변수 파일**: `supabase.env` 등에 프로젝트 URL·서비스 롤 키·엑세스 토큰을 저장하고, 컨테이너 실행 시 `--env-file`로 주입합니다.

예시 (`supabase.env`):
```
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```
> 비밀 값은 항상 `.gitignore` 처리하세요.

컨테이너 기본 실행 패턴:
```
docker run --rm -it \
  -v "$(pwd)":/workspace \
  -w /workspace \
  --env-file supabase.env \
  supabase/cli:v1.166.3 supabase --help
```

## 2. 프로젝트 링크 및 디렉터리 부트스트랩
1. `docker run ... supabase login`으로 액세스 토큰을 사용한 인증 수행. 토큰을 재사용하려면 `-v "$HOME/.supabase":/home/supabase/.supabase` 볼륨을 추가합니다.
2. 리포지토리 루트에서 `docker run ... supabase link --project-ref <project-ref>` 실행 → `supabase/config.toml` 생성.
3. (옵션) `docker run ... supabase init`으로 `supabase/functions` 등 기본 구조를 마련합니다.

권장 디렉터리 구조:
```
root/
├─ supabase/
│  ├─ config.toml
│  └─ functions/
│     └─ morning-nudge/
│        ├─ index.ts
│        └─ deno.json
```

## 3. Edge Function 초안 작성
Cron은 HTTP POST를 트리거하므로 Edge Function을 먼저 준비합니다. `supabase/functions/morning-nudge/index.ts` 예시:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const payload = await req.json().catch(() => null);

  // TODO: streak 계산, 대상자 필터링, 알림 호출 등 실제 로직 추가
  console.log("morning-nudge invoked", { payload });

  return new Response(
    JSON.stringify({ ok: true, message: "Morning nudge scheduled" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
});
```

로컬 테스트 (Docker 호환):
```
docker run --rm -it \
  -v "$(pwd)":/workspace \
  -w /workspace \
  --env-file supabase.env \
  -p 54321:54321 \
  supabase/cli:v1.166.3 supabase functions serve morning-nudge
```

> `supabase functions serve` 명령은 CLI 문서([Serve guide](https://github.com/supabase/cli/blob/develop/docs/supabase/functions/serve.md))에 기재된 플래그(`--inspect` 등)를 동일하게 지원합니다.

## 4. 함수 배포 및 권한 설정
1. `docker run ... supabase functions deploy morning-nudge`로 배포합니다.
2. Cron에서 JWT 검증이 필요 없다면 `--no-verify-jwt` 플래그를 함께 전달합니다.
3. Supabase Dashboard → **Authentication → Policies**에서 Edge Function이 접근하는 테이블의 RLS 정책과 서비스 키 사용 범위를 점검합니다.

## 5. Cron 스케줄 생성
Supabase Cron은 UTC 기준으로 실행됩니다. Cron CLI는 Docker 컨테이너에서 그대로 호출하면 됩니다.

```
docker run --rm -it \
  --env-file supabase.env \
  supabase/cli:v1.166.3 supabase cron create morning-nudge-daily \
    --schedule "0 21 * * *" \
    --request-url "https://<project-ref>.supabase.co/functions/v1/morning-nudge" \
    --request-method POST \
    --header 'Content-Type: application/json' \
    --body '{"source":"cron"}'
```
- `--schedule`: 표준 cron 표현식. 위 값은 UTC 21시(한국 오전 6시)에 실행됩니다. [공식 문서](https://github.com/supabase/supabase/blob/master/apps/www/_blog/2021-03-05-postgres-as-a-cron-server.mdx#_snippet_7)에 일반적인 표현식 예시가 있습니다.
- `--request-url`: Edge Function invoke URL.
- `--header`, `--body`: 함수가 기대하는 페이로드 구조에 맞게 정의.

명령 플래그는 CLI 버전에 따라 다를 수 있으므로 `docker run ... supabase cron create --help`로 최신 사용법을 확인하세요.

## 6. Cron 관리
- 스케줄 조회: `docker run ... supabase cron list`
- 스케줄 수정: `docker run ... supabase cron update morning-nudge-daily --schedule "0 22 * * *"`
- 스케줄 비활성화: `docker run ... supabase cron toggle morning-nudge-daily --disabled`
- 스케줄 삭제: `docker run ... supabase cron delete morning-nudge-daily`

데이터베이스 레벨에서 상태를 확인하려면 `cron.job`과 `cron.job_run_details`를 조회합니다. 공식 SQL 예시는 [quickstart.mdx](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/cron/quickstart.mdx#L1-L120) 참고.

## 7. 운영 체크리스트
- [ ] Edge Function 비밀 값은 Supabase **Project Settings → Configuration → Secrets**에 저장하고 `vault.decrypted_secrets`로 가져와 사용.
- [ ] Cron 실행 시간을 서비스 타임존(UTC ↔ KST 등)에 맞춰 검증.
- [ ] `cron.job_run_details`와 Log Explorer에서 실패 기록을 주기적으로 모니터링.
- [ ] 장애 대응을 위해 함수 로그를 외부 Observability 도구(Sentry, Datadog 등)와 연동.
- [ ] README/Runbook에 Cron 이름·목적·스케줄·관련 Edge Function을 문서화.

위 준비를 마치면 Supabase Cron과 Edge Function이 Docker 기반 워크플로우에서도 안정적으로 동작하도록 설정할 수 있습니다. 이후 Phase 3 작업에서 비즈니스 로직과 알림 채널을 확장하세요.
