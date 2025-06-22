import Navigation from '../_components/Navigation';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  );
}
