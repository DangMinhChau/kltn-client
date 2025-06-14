import { useState, useEffect } from "react";
import {
  vietnamLocationApi,
  Province,
  District,
  Ward,
} from "@/lib/api/vietnam-locations";

// Global cache for provinces to avoid re-fetching
let globalProvinces: Province[] = [];
let provincesLoaded = false;

export const useVietnamLocations = () => {
  const [provinces, setProvinces] = useState<Province[]>(globalProvinces);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on first use
  useEffect(() => {
    const loadProvinces = async () => {
      if (provincesLoaded) {
        setProvinces(globalProvinces);
        return;
      }

      try {
        setLoading(true);
        console.log("🏛️ Loading provinces for the first time...");
        const data = await vietnamLocationApi.getProvinces();
        globalProvinces = data;
        provincesLoaded = true;
        setProvinces(data);
        console.log("✅ Provinces loaded:", data.length);
      } catch (error) {
        console.error("❌ Failed to load provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  const loadDistricts = async (provinceCode: string) => {
    try {
      setLoadingDistricts(true);
      console.log("🏢 Loading districts for province:", provinceCode);
      const data = await vietnamLocationApi.getDistricts(Number(provinceCode));
      setDistricts(data);
      setWards([]); // Reset wards when province changes
      console.log("✅ Districts loaded:", data.length);
    } catch (error) {
      console.error("❌ Failed to load districts:", error);
      throw error;
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: string) => {
    try {
      setLoadingWards(true);
      console.log("🏘️ Loading wards for district:", districtCode);
      const data = await vietnamLocationApi.getWards(Number(districtCode));
      setWards(data);
      console.log("✅ Wards loaded:", data.length);
    } catch (error) {
      console.error("❌ Failed to load wards:", error);
      throw error;
    } finally {
      setLoadingWards(false);
    }
  };

  return {
    provinces,
    districts,
    wards,
    loading,
    loadingDistricts,
    loadingWards,
    loadDistricts,
    loadWards,
  };
};
