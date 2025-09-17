# Morning Glory Product Plan

## Phase 0 – Alignment & Architecture
- 사용자 페르소나, 주요 동기, 핵심 가치 제안 정의 및 목표 KPI 설정(예: DAU, 7-day streak 유지율, Nudge opt-in 비율)
- 데이터 모델 어라인: 체크인, 알림, 루틴 스케줄, 사용자 설정 스키마 초안 수립 및 설계 리뷰
- 인프라 결정: 이미지 스토리지(S3/Supabase Storage), 서버옵스(Cloud Run/Render), 크론 워커 배포 전략(Supabase cron), 계측 툴(Amplitude/Segment) 선정

## Phase 1 – Auth & Profile Foundation
- Google OAuth 플로우 보강: 토큰 회전, 세션 만료/철회, 쿠키 보안 속성 점검
- 온보딩 폼 구축: 닉네임, 기상/취침 창, 목표 streak 등 설정 수집 후 `users` 테이블 보강
- 알림 채널 선호도 수집(푸시/이메일/SMS) 및 옵트인 기록 저장

## Phase 2 – Check-in Capture & Storage
- 카메라 캡처 이미지 업로드: presigned URL 흐름, 썸네일 생성 및 Supabase Storage 연동
- 체크인 검증 로직: 허용 시간대, 위치/디바이스 메타데이터 저장, 중복 체크 및 재인증 처리
- Celebrate & streak 피드백 개선: 적응형 메시지, 인터벌 알림, 실패 시 회복 경로 설계

## Phase 3 – Nudge Engine MVP
- 루틴 스케줄 테이블 및 알림 생성: Supabase cron/Edge Functions로 스케줄 실행
- Nudging 규칙: 지각/미체크 감지 시 단계적 알림, 온화한 카피, Quiet hours 준수
- In-app nudges: 미션 카드, 호흡 버블, 행동 유도 모달 등 UX 추가

## Phase 4 – Reflection & Social Layer
- 체크인 히스토리 및 무드 로그: 캘린더/타임라인, 기분 태그 저장 및 시각화
- 성취 시스템: streak 배지, 주간 리포트, 회복 모드 제공
- 소셜 요소: 아침 동행 매칭, 응원/댓글, 그룹 챌린지(옵트인 기반)

## Phase 5 – Observability & Launch
- 이벤트 로깅 및 A/B 실험 기초: Segment/Amplitude 연동, Nudging 실험 템플릿 구축
- 접근성 & 다크 모드 QA, 성능 모니터링(Web Vitals) 및 안전성 점검
- Docker 기반 배포 파이프라인 확정, 운영 문서/런북, GDPR 등 개인정보 가이드 정리

## 주요 리스크 & 의존성
- Google Cloud OAuth 설정 및 검수 지연 가능성
- 푸시 제공자(FCM 등) 인증서/키 확보 및 iOS PWA 제약
- 이미지·위치 데이터 처리에 대한 개인정보 정책 및 비용 합의
- 메시징 채널 국내 규제(KISA 문자 사전등록 등) 대응

## 다음 단계 제안
1. Phase 0 산출물 구체화(사용자 여정 맵, 스키마 초안) 및 이해관계자 합의
2. Phase 1 상세 작업(WBS) 분해와 이행 순서 확정
