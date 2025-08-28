import OrderTable from '@/components/admin/orders/OrderTable';
import {Order} from '@/lib/validators';
import AdminHeader from '../shared/AdminHeader';

type OrderManagerProps = {
  orders: Order[];
};

export default function OrderManager({orders}: OrderManagerProps) {
  return (
    <div>
      <AdminHeader title='Beställningsöversikt' count={orders.length} />
      <OrderTable orders={orders} />
    </div>
  );
}
