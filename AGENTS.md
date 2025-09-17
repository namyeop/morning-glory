# 리포지토리 가이드라인

## 프로젝트 구조 & 모듈 구성
- 소스는 `app/` 에 위치합니다 (라우트는 `app/routes/*`, 라우트 테이블 `app/routes.ts`, 루트 레이아웃 `app/root.tsx`, 공용 컴포넌트 `app/welcome/*`).
- 퍼블릭 에셋은 `public/` 에 위치합니다 (예: `public/favicon.ico`).
- 구성 파일: `vite.config.ts`, `react-router.config.ts` (SSR 활성화), `tsconfig.json` (strict TS; 별칭 `~/*` → `app/*`).
- `pnpm build` 이후 산출물은 `build/` 에 생성됩니다 (`build/client`, `build/server`).
- Dockerfile 은 프로덕션 앱을 빌드하고 서빙합니다.

## 빌드, 테스트, 개발 명령어
- `pnpm dev`: 로컬 개발 서버(HMR, React Router) 시작.
- `pnpm build`: 프로덕션 클라이언트/서버 번들 생성.
- `pnpm start`: `build/server/index.js` 에서 빌드된 앱 실행.
- `pnpm typecheck`: 라우트 타입 생성 후 `tsc` 실행.
- Docker: `docker build -t morning-glory .` 후 `docker run -p 3000:3000 morning-glory`.

## 코딩 스타일 & 네이밍 컨벤션
- TypeScript, ES2022 모듈, JSX(`react-jsx`) 사용. 들여쓰기 2칸.
- 컴포넌트: PascalCase (예: `Welcome`). 변수/함수: camelCase.
- 라우트: `app/routes/` 하위 파일은 소문자 (예: `home.tsx`).
- 내부 경로 임포트는 `~/*` 별칭을 우선 사용.
- 스타일링: Vite 플러그인을 통한 Tailwind CSS 사용.

## 테스트 가이드라인
- 테스트 러너는 아직 구성되지 않았습니다. 권장: Vitest + React Testing Library.
- 테스트는 소스 인접에 배치: `app/**/__tests__/*.{test,spec}.tsx` 또는 `*.test.tsx`.
- 라우트 loader/action, 컴포넌트, ErrorBoundary 중심으로 검증.
- 테스트가 추가되면 `pnpm test` 실행 전 항상 `pnpm typecheck` 를 먼저 수행.

## 커밋 & PR 가이드라인
- 커밋: Conventional Commits 사용 (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). 변경 범위는 작게 유지.
- PR: 명확한 요약, 이슈 링크(예: `Closes #123`), UI 변경 시 스크린샷/GIF 포함.
- CI/빌드: 리뷰 전 `pnpm typecheck` 및 `pnpm build` 성공 보장.

## 보안 & 설정 팁
- SSR 은 `react-router.config.ts` 에서 활성화되어 있습니다. SPA 만 필요하면 `ssr: false` 로 전환하세요.
- 시크릿은 절대 커밋하지 마세요. 환경 변수와 플랫폼 시크릿 스토어 사용.
- 외부 입력은 loader/action 에서 검증하고 `ErrorBoundary` 로 오류 처리.

---

## 디자인 시스템 가이드라인 (shadcn/ui + Headspace 영감)

아래 규칙은 트렌디하면서도 명상 앱과 유사한, 차분하고 따뜻한 경험을 구축하기 위한 일관된 디자인 기준입니다. Headspace 디자인에서 영감을 받되, 고유한 브랜드 아이덴티티를 유지합니다.

### 목표
- 따뜻함, 단순함, 접근성: 시각적 잡음을 줄이고 여백과 색으로 안정감을 제공.
- 집중과 휴식의 균형: 정보 구조는 간결하게, 상호작용은 부드럽게.
- 시스템화된 구성: shadcn/ui를 기반으로 재사용 가능한 패턴 구축.

### 기술 스택
- UI 컴포넌트: shadcn/ui(Radix UI + Tailwind). `components.json` 으로 토큰/라디우스 관리.
- 스타일: Tailwind CSS(프로젝트 기본 설정 유지). CSS 변수 기반 테마(ligth/dark) 구성.
- 아이콘: `lucide-react` 사용 권장. 선형, 1.5–2px 스트로크, 라운드 캡.

### 디자인 토큰(Design Tokens)
- 색상(Color): `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover` 정의.
- 반경(Radius): `--radius` 로 기본 곡률 제어. 기본 12px, 대형 요소는 16–24px 권장.
- 간격(Spacing): 4pt 그리드. 핵심 섹션 여백은 8 또는 16의 배수.
- 타이포그래피: 한국어 본문은 가독성 높은 산세리프(예: Pretendard, Inter). 헤딩은 둥글고 친근한 인상.

### 색상 팔레트(Headspace 영감, 비침해)
- 프라이머리(따뜻한 오렌지): 예) `#FF7A45` / 대비 텍스트는 어두운 색.
- 포커스/링(선명한 코럴/살구톤): 예) `#FF8A65`, `#FFB38A`.
- 서피스 뉴트럴(샌드/아이보리): 예) `#FFF8F2`, `#F6E6DA`.
- 포지티브/차분한 그린/틸: 예) `#57C5B6`, `#3BAA9C` (보조 강조용).
- 정보/깊이감 인디고/네이비: 예) `#2A3B6A`, 다크 모드 기본 배경에 사용.
- 그라디언트는 부드러운 두 색상 혼합만 사용(하드 스톱 금지, 노이즈/패턴 최소화).

### 타이포그래피
- 헤딩: 단계적 스케일(H1–H6). H1 36–40, H2 28–32, H3 22–24(px 기준).
- 본문: 16–18px, 줄간 1.6–1.75. 문장 길이 45–75자 권장.
- 톤: 친근하고 부드럽게. 명령형 대신 제안형 문구 사용(예: “함께 쉬어볼까요?”).

### 모양 & 레이아웃
- 카드와 컨테이너는 둥근 모서리(12–20px)와 넉넉한 패딩(24–32px)을 기본.
- 대면 배치: 중심 정렬 + 넓은 여백으로 안정감 제공. 긴 목록은 그룹/섹션화.
- 일러스트 배경은 유기적 블롭/소프트 쉐이프, 불규칙 라운드 형태.

### 컴포넌트 규칙(shadcn/ui)
- 버튼(`Button`):
  - Primary: 따뜻한 오렌지 솔리드(텍스트는 어두운/화이트 대비). Hover는 약간 진하게, Active는 살짝 어둡게.
  - Secondary: 뉴트럴 톤(샌드/그레이) 배경, 섬세한 보더.
  - Ghost: 텍스트만 강조, 배경 투명. Hover에 소프트 배경.
  - Focus ring: 2px, 코럴/살구 계열.
- 카드(`Card`): 부드러운 그림자(저강도), 가장자리는 번짐 없이 균일. 상단 헤더 여백 크게.
- 다이얼로그/시트(`Dialog`, `Sheet`): 백드롭은 저불투명, 컨텐츠는 스케일 98% → 100% 페이드.
- 탭/내비(`Tabs`, `NavigationMenu`): 활성 탭은 pill 형태 + 부드러운 배경 강조.
- 폼(`Input`, `Textarea`, `Select`): 보더는 중성 컬러, 포커스에서 `--ring` 강조. 에러는 `--destructive` 와 보조 텍스트.

### 상태, 접근성, 가독성
- 대비: 텍스트 대비 최소 4.5:1 유지. 버튼/링크는 색+형태로 중복 신호 제공.
- 포커스: 키보드 탐색 100% 가능. 포커스 링 항상 표시(사용자 설정 우선).
- 모션 감소: 시스템 `prefers-reduced-motion` 준수, 핵심 정보는 모션 없이 전달.

### 모션 가이드
- 전역 전환 150–250ms, 이징은 `ease-out` 또는 `ease-in-out`.
- 의미 있는 피드백에만 사용. 바운스/스프링 과도 사용 금지.
- 명상 맥락 요소(예: “호흡 버블”)는 3–6초의 느린 펄스.

### 일러스트 & 이미지
- 따뜻한 파스텔톤, 단순한 형태, 사람 중심의 친근한 표정. 과도한 디테일/현실감 회피.
- 브랜드/저작권 침해 소지 있는 Headspace 고유 캐릭터/자산 복제 금지. “분위기”만 참고.

### 다크 모드
- 배경은 딥 네이비/인디고, 텍스트는 높은 대비의 따뜻한 화이트.
- 프라이머리는 다크에서 과채도 금지(명도만 살짝 올림). 그림자는 투명도 중심.

### 카피 톤 & 마이크로카피
- 톤: 공감, 격려, 자기 연민. 짧고 긍정적인 문장.
- 행동 유도: “시작하기”보다 “잠시 쉬어가기” 같은 완곡 표현 우선.

### 구현 체크리스트(shadcn/ui)
- `components.json` 에서 `tailwind.css`, `tsx` 경로와 `radii` 를 프로젝트 규칙으로 설정.
- `tailwind.config.ts` 에 테마 CSS 변수 매핑. light/dark 둘 다 정의.
- 공통 유틸 `cn` 병합 사용(클래스 충돌 방지). 컴포넌트 API는 단순/일관.

### 예시: CSS 변수 토큰 스켈레톤
```css
:root {
  --background: 30 33% 99%; /* 샌드 아이보리 */
  --foreground: 220 15% 12%;
  --card: 0 0% 100%;
  --card-foreground: 220 15% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 15% 12%;
  --primary: 18 100% 62%; /* 따뜻한 오렌지 */
  --primary-foreground: 0 0% 100%;
  --secondary: 30 20% 96%;
  --secondary-foreground: 220 15% 12%;
  --muted: 30 18% 92%;
  --muted-foreground: 220 10% 40%;
  --accent: 12 90% 68%; /* 코럴/살구 */
  --accent-foreground: 220 15% 12%;
  --destructive: 3 85% 58%;
  --destructive-foreground: 0 0% 100%;
  --border: 25 15% 88%;
  --input: 25 15% 88%;
  --ring: 15 90% 65%;
  --radius: 12px;
}
.dark {
  --background: 220 35% 7%; /* 네이비 톤 */
  --foreground: 30 33% 98%;
  --card: 220 35% 9%;
  --card-foreground: 30 33% 98%;
  --popover: 220 35% 9%;
  --popover-foreground: 30 33% 98%;
  --primary: 18 100% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 25% 12%;
  --secondary-foreground: 30 33% 98%;
  --muted: 220 20% 14%;
  --muted-foreground: 30 12% 75%;
  --accent: 15 85% 62%;
  --accent-foreground: 220 35% 7%;
  --destructive: 3 75% 56%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 22% 18%;
  --input: 220 22% 18%;
  --ring: 15 85% 64%;
}
```

### Headspace 참고 규칙(요약)
- 따뜻한 오렌지 계열을 핵심 정체성으로 사용하되, 과도한 채도/대비는 지양.
- 유기적 도형, 넉넉한 여백, 부드러운 모션으로 편안함을 강조.
- 캐릭터/브랜드 자산은 “참고”만 하고 직접 복제/파생 금지.

### 품질 점검 체크리스트
- [ ] 컬러 대비 4.5:1 충족
- [ ] 포커스 가능한 모든 요소에 키보드 포커스 링 표시
- [ ] 라운드/그림자/간격 스케일이 화면 전반에서 일관
- [ ] 모션 감소 설정 준수 및 핵심 정보 전달에 모션 의존 없음
- [ ] 라이트/다크 모드 모두에서 시각적 위계 유지

