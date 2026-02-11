import ActionSheet from "@/components/ActionSheet";
import React, { useState } from "react";
import CalendarPage from "./coffeeCalendar";
import { ArrowDown, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/stores/order-store";

interface OrderSelectSubscriptionDeleviryDateProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderSelectSubscriptionDeleviryDate: React.FC<
  OrderSelectSubscriptionDeleviryDateProps
> = ({ isOpen, onClose }) => {
  const [cycles, setCycles] = useState<number | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const router = useRouter();
  const { setSubscriptionInfo, order } = useOrderStore();

  const orderTotalQty = order.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose} title="정기구독 배송일 선택">
      <div className="mt-4">
        <div className="mb-6">
          <h3 className="text-sm leading-[20px] font-bold mb-2">이용횟수</h3>
          <div className="relative">
            <select
              value={cycles || ""}
              onChange={(e) => setCycles(Number(e.target.value))}
              className={`w-full h-[40px] text-xs text-text-secondary pl-4 pr-2 border border-border-default rounded-lg appearance-none bg-white focus:outline-none focus:ring-[#A45F37] focus:border-[#A45F37]`}
            >
              <option value="">이용횟수를 선택해주세요.</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="12">12</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown width={16} height={16} />
            </div>
          </div>
        </div>
        <CalendarPage
          deliveryDate={deliveryDate}
          setDeliveryDate={setDeliveryDate}
        />

        <button
          disabled={!deliveryDate || !cycles}
          className="w-full mt-6 btn-primary"
          onClick={() => {
            if (!deliveryDate || !cycles) return;
            const firstDeliveryIso = deliveryDate.toISOString();
            const qty = Math.max(1, orderTotalQty);
            setSubscriptionInfo({
              total_cycles: cycles,
              first_delivery_date: firstDeliveryIso,
            });
            const params = new URLSearchParams({
              cycles: String(cycles),
              delivery: firstDeliveryIso,
              qty: String(qty),
            });
            router.push(`/purchase-subscription?${params.toString()}`);
          }}
        >
          결제하기
        </button>
      </div>
    </ActionSheet>
  );
};

export default OrderSelectSubscriptionDeleviryDate;
