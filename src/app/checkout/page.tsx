import CheckoutForm from '@/components/shop/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      <div className="container-mel py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-tierra-900 mb-2">Checkout</h1>
          <p className="font-serif italic text-tierra-500">Ya casi es tuya. Completá los datos para finalizar.</p>
        </div>
        <CheckoutForm />
      </div>
    </div>
  );
}
