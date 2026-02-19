'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SpiderChart from '@/app/(content-only)/analysis/SpiderChart';

interface TasteRating {
    aroma: number;
    acidity: number;
    sweetness: number;
    nuttiness: number;
    body: number;
}

interface BannerItem {
    id: number;
    title: string | null;
    comment: string | null;
    desc: string | null;
    banner_url: string | null;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

const MonthlyCoffeeTab = () => {
    const [monthlyCoffee, setMonthlyCoffee] = useState<BannerItem | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMonthlyCoffee = async () => {
            try {
                    // MonthlyCoffeeTab.tsx
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/banners/current?limit=1`);                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setMonthlyCoffee(data[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch monthly coffee:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyCoffee();
    }, []);

    if (loading) {
        return (
            <div className="bg-background-sub rounded-lg p-4 pt-0 text-gray-0 text-center py-8">
                <p className="text-text-secondary text-sm">로딩 중...</p>
            </div>
        );
    }

    if (!monthlyCoffee) {
        return (
            <div className="bg-background-sub rounded-lg p-4 pt-0 text-gray-0 text-center py-8">
                <p className="text-text-secondary text-sm">이달의 커피가 없습니다.</p>
            </div>
        );
    }

    const ratings: TasteRating = {
        aroma: 1,
        acidity: 1,
        sweetness: 1,
        body: 1,
        nuttiness: 1
    };

    return (
        <div className="bg-background-sub rounded-lg p-4 pt-0 text-gray-0">
            <div className='mb-2 text-center'>
                <h3 className="text-[14px] font-medium mb-1 leading-[20px]">{monthlyCoffee.title || "이달의 커피"}</h3>
                <p className="text-text-secondary text-xs font-normal leading-[18px]">
                    {monthlyCoffee.comment ? `" ${monthlyCoffee.comment}"` : '" 이달의 추천 커피입니다."'}
                </p>
            </div>
            <SpiderChart
                ratings={ratings}
                setRatings={() => { }}
                isChangable={false}
                isClickable={true}
                size="medium"
                wrapperClassName="!mb-1"
            />
            <div className="flex justify-center gap-2 mt-1">
                <button 
                    className='w-full btn-action !text-base !leading-[24px] !font-bold !py-3 !rounded-lg'
                    onClick={() => router.push(`/my-coffee/monthly-coffee/detail?bannerId=${monthlyCoffee.id}`)}
                >
                    자세히 보기
                </button>
            </div>
        </div>
    );
};

export default MonthlyCoffeeTab;
