"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TabsPage() {
  return (
    <PageShell title="Tabs">
      <div className="flex flex-col gap-16 pt-16">
        <div className="flex flex-col gap-4 px-20">
          <span className="type-overline text-on-surface-tertiary">Underline tabs</span>
          <p className="type-bodySm text-on-surface-secondary">Animated indicator follows active tab.</p>
        </div>
        <Tabs defaultValue="overview">
          <TabsList showDivider>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Overview content here.</p></TabsContent>
          <TabsContent value="positions"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Positions content here.</p></TabsContent>
          <TabsContent value="orders"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Orders content here.</p></TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-16 pt-16">
        <div className="flex flex-col gap-4 px-20">
          <span className="type-overline text-on-surface-tertiary">2 tabs</span>
        </div>
        <Tabs defaultValue="buy">
          <TabsList>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Buy panel.</p></TabsContent>
          <TabsContent value="sell"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Sell panel.</p></TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-16 pt-16">
        <div className="flex flex-col gap-4 px-20">
          <span className="type-overline text-on-surface-tertiary">Many tabs</span>
        </div>
        <div className="overflow-x-auto">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="etfs">ETFs</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">All assets.</p></TabsContent>
            <TabsContent value="crypto"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Crypto assets.</p></TabsContent>
            <TabsContent value="stocks"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Stock assets.</p></TabsContent>
            <TabsContent value="etfs"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">ETF assets.</p></TabsContent>
            <TabsContent value="forex"><p className="type-bodyMd text-on-surface-secondary px-20 py-16">Forex pairs.</p></TabsContent>
          </Tabs>
        </div>
      </div>
    </PageShell>
  );
}
