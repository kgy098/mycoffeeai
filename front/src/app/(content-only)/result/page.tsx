'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRecommendationStore } from '@/stores/recommendation-store';
import SpiderChart from '../analysis/SpiderChart';
import { CoffeePreferences } from '@/types/coffee';

const ATTRIBUTES: Array<{
  key: keyof CoffeePreferences;
  label: string;
  description: string;
}> = [
  { key: 'aroma', label: '향', description: '풍부하고 매혹적인 향이 인상적입니다.' },
  { key: 'acidity', label: '산미', description: '상큼한 산미가 또렷하게 느껴집니다.' },
  { key: 'sweetness', label: '단맛', description: '입안 가득 자연스러운 단맛이 감돕니다.' },
  { key: 'nutty', label: '고소함', description: '볶은 견과류 같은 깊은 고소함이 강조됩니다.' },
  { key: 'body', label: '바디', description: '적당한 농도와 무게감이 있습니다.' },
];

function StarRating({ score }: { score: number }) {
  const full = Math.min(5, Math.max(0, Math.round(score)));
  return (
    <span className="text-accent text-base tracking-tight" aria-label={`${full}점`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { preferences } = useRecommendationStore();

  const hasPreferences = !!(
    preferences &&
    typeof preferences.aroma === 'number' &&
    typeof preferences.body === 'number'
  );

  useEffect(() => {
    if (!hasPreferences) {
      router.replace('/analysis');
    }
  }, [hasPreferences, router]);

  if (!hasPreferences) {
    return null;
  }

  const safePrefs = preferences ?? {
    aroma: 1,
    acidity: 1,
    sweetness: 1,
    nutty: 1,
    body: 1,
  };

  return (
    <div className="min-h-[100dvh] bg-[#1a1a1a] flex flex-col">
      <div className="flex-1 px-4 pt-6 pb-8">
        {/* Radar chart (dark theme overrides for labels/grid) */}
        <div className="result-chart-dark flex justify-center mb-8">
          <SpiderChart
            ratings={safePrefs}
            setRatings={() => {}}
            isChangable={false}
            isClickable={false}
            size="large"
            wrapperClassName="[&_svg]:drop-shadow-[0_0_24px_rgba(255,121,39,0.25)]"
          />
        </div>

        {/* Attribute list */}
        <ul className="space-y-4 mb-10">
          {ATTRIBUTES.map(({ key, label, description }) => (
            <li key={key} className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/90">{label}</span>
                <span className="text-text-secondary text-xs">({safePrefs[key]})</span>
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <StarRating score={safePrefs[key]} />
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{description}</p>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="space-y-3">
          <p className="text-center text-white text-sm font-medium leading-relaxed">
            나만의 맞춤 커피 추천, 지금 회원가입하고 시작하세요!
          </p>
          <Link
            href="/auth/login-select"
            className="btn-primary w-full text-center block"
          >
            회원가입하기
          </Link>
          <Link
            href="/home"
            className="block w-full text-center text-sm text-white/70 underline underline-offset-2 py-2"
          >
            둘러보고 나중에 할래요.
          </Link>
        </div>
      </div>
    </div>
  );
}
