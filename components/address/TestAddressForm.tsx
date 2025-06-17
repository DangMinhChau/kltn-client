"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GHNAddressForm from "./GHNAddressForm";
import DirectGHNAddressForm from "./DirectGHNAddressForm";

interface AddressFormData {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  province: string;
  district: string;
  ward: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceCode?: string;
  ghnDistrictCode?: string;
  isDefault: boolean;
}

interface TestAddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AddressFormData>;
  isLoading?: boolean;
}

const TestAddressForm: React.FC<TestAddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("backend");

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test Address Form - Backend vs Direct GHN API</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">Backend Proxy (Recommended)</Badge>
          <Badge variant="outline">Direct API (Testing only)</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backend">Backend Proxy</TabsTrigger>
            <TabsTrigger value="direct">Direct GHN API</TabsTrigger>
          </TabsList>

          <TabsContent value="backend" className="mt-4">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Backend Proxy:</strong> API calls go through your
                backend, which handles authentication and CORS. This is the
                recommended approach for production.
              </p>
            </div>
            <GHNAddressForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              initialData={initialData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="direct" className="mt-4">
            <div className="mb-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Direct API:</strong> Frontend calls GHN API directly.
                May face CORS issues and exposes API keys. Only use for
                development/testing.
              </p>
            </div>
            <DirectGHNAddressForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              initialData={initialData}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestAddressForm;
