import OrderTable from '@/components/admin/orders/OrderTable';
import {Order} from '@/lib/validators';

type OrderManagerProps = {
  orders: Order[];
};

export default function OrderManager({orders}: OrderManagerProps) {
  return <OrderTable orders={orders} />;
}