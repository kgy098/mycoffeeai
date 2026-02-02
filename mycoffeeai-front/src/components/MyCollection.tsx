'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import SpiderChart from '@/app/(content-only)/analysis/SpiderChart';
import Tabs from './Tabs';
import OtherCoffeeSlider from './OtherCoffeeSlider';
import Link from 'next/link';

interface TasteRating {
    aroma: number;
    acidity: number;
    sweetness: number;
    nutty: number;
    body: number;
}

interface CoffeeBlend {
    name: string;
    description: string;
    hashtags: string[];
    ratings: TasteRating;
}

const MyCollection = () => {

    const [currentTab, setCurrentTab] = useState('monthly-coffee');
    const [isGuestView, setIsGuestView] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
            const hasToken = !!tokenCookie;
            setIsGuestView(!hasToken);
        }
    }, []);

    // const { data: myCollection } = useGet(['collections', data?.user_id], '/collections', {params: {user_id: data?.user_id}});

    const tabs = [
        { id: 1, label: "이달의 커피", value: "monthly-coffee" },
        { id: 2, label: "내 커피 컬렉션", value: "my-collection" },
    ];

    const coffeeBlends: CoffeeBlend[] = [
        {
            name: "벨벳 터치 블렌드",
            description: "오늘, 깊고 깔끔한 맛을 가진, 마시기 편한 Deep Body Blend가 당신에게 딱 맞습니다.",
            hashtags: ["씁쓸 달콤", "고소한 맛"],
            ratings: {
                aroma: 4,
                acidity: 3,
                sweetness: 4,
                nutty: 5,
                body: 5
            }
        },
        {
            name: "벨벳 터치 블렌드",
            description: "깔끔한 마무리와 산뜻한 입안 감촉이 좋은 커피입니다.",
            hashtags: ["씁쓸 달콤", "고소한 맛"],
            ratings: {
                aroma: 5,
                acidity: 4,
                sweetness: 4,
                nutty: 3,
                body: 4
            }
        },
        {
            name: "벨벳 터치 블렌드 ",
            description: "깔끔한 마무리와 산뜻한 입안 감촉이 좋은 커피입니다.",
            hashtags: ["씁쓸 달콤", "고소한 맛"],
            ratings: {
                aroma: 5,
                acidity: 4,
                sweetness: 4,
                nutty: 3,
                body: 4
            }
        },
        {
            name: "벨벳 터치 블렌드 ",
            description: "깔끔한 마무리와 산뜻한 입안 감촉이 좋은 커피입니다.",
            hashtags: ["씁쓸 달콤", "고소한 맛", "밸런스"],
            ratings: {
                aroma: 5,
                acidity: 4,
                sweetness: 4,
                nutty: 3,
                body: 4
            }
        }
    ];

    const handleTabChange = (tab: string) => {
        if (tab === currentTab) return;

        setCurrentTab(tab);
    };

    return (
        <div className={`mb-3 bg-background-sub text-gray-0 py-3`}>
            <div className="flex items-center justify-between mb-3 pr-6 pl-4">
                <div className='w-[176px]'>
                    <Tabs
                        tabs={tabs}
                        activeTab={currentTab}
                        onTabChange={handleTabChange}
                    />
                </div>
                <svg className='cursor-pointer' xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <path d="M1.5 10.5L6.5 6L1.5 1.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {currentTab === 'my-collection' ? (
                isGuestView ? (
                    <div className="bg-background-sub rounded-lg px-4 text-gray-0 text-center pb-[194px] pt-[128px]">
                    <div>
                        <p className="text-[14px] font-normal text-text-secondary mb-2 leading-[20px]">
                            지금 로그인하고, 내 커피 취향을 확인하세요!
                        </p>
                        <Link href="/auth/login" className="btn-action w-full text-center px-[14px]">
                        로그인
                        </Link>
                    </div>
                </div>
                )
                    :(
                        <div className={currentTab === 'my-collection' ? 'pl-4' : ''}>
                            <OtherCoffeeSlider />
                        </div>
                    )
                
            ) : (
                <div className="bg-background-sub rounded-lg p-4 pt-0 text-gray-0">
                    <div className='mb-2 text-center'>
                        <h3 className="text-[14px] font-medium mb-1 leading-[20px]">{coffeeBlends[0].name}</h3>
                        <p className="text-text-secondary text-xs font-normal leading-[18px]">" 오늘은 부담 없이 즐기기 좋은, 깊이 있으면서도 <br />깔끔한 딥 바디 블렌드가 잘 어울려요."</p>
                    </div>
                    <SpiderChart
                        ratings={coffeeBlends[0].ratings}
                        setRatings={() => { }}
                        isChangable={false}
                        isClickable={true}
                        size="medium"
                        wrapperClassName="!mb-1"
                    />
                    <div className="flex justify-center gap-2 mt-1">
                        <button className='w-full btn-action !text-base !leading-[24px] !font-bold !py-3 !rounded-lg'>
                            자세히 보기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCollection;