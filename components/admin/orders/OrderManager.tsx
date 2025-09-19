import OrderTable from '@/components/admin/orders/OrderTable';
import {Order} from '@/lib/types/db-types';
import AdminHeader from '../shared/AdminHeader';
import AdminSearch from '../shared/AdminSearch';

type OrderManagerProps = {
  orders: Order[];
};

export default function OrderManager({orders}: OrderManagerProps) {
  return (
    <div>
      <AdminHeader title='Beställningsöversikt' count={orders.length} />
      <AdminSearch
        searchParam='search'
        maxLength={50}
        placeholder='SÖK kund, order-id, mail, adress'
      />
      <OrderTable orders={orders} />
    </div>
  );
}
