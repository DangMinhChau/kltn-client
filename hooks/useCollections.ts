import { useState, useEffect } from "react";
import { collectionApi, adminCollectionApi } from "@/lib/api";
import { Collection, PaginationResult } from "@/types";
import {
  CollectionFilters,
  CreateCollectionData,
  UpdateCollectionData,
  AssignProductsData,
} from "@/lib/api/collections";
import { toast } from "sonner";

export function useCollections(filters?: CollectionFilters) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async (newFilters?: CollectionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const result = await collectionApi.getCollections({
        ...filters,
        ...newFilters,
      });

      setCollections(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to fetch collections");
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const refetch = (newFilters?: CollectionFilters) => {
    return fetchCollections(newFilters);
  };

  return {
    collections,
    pagination,
    loading,
    error,
    refetch,
  };
}

export function useCollection(slug: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const result = await collectionApi.getCollection(slug);
      setCollection(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch collection");
      console.error("Error fetching collection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [slug]);

  const refetch = () => {
    return fetchCollection();
  };

  return {
    collection,
    loading,
    error,
    refetch,
  };
}

export function useAdminCollections(filters?: CollectionFilters) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async (newFilters?: CollectionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminCollectionApi.getCollections({
        ...filters,
        ...newFilters,
      });

      setCollections(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to fetch collections");
      console.error("Error fetching admin collections:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (data: CreateCollectionData) => {
    try {
      setLoading(true);

      const newCollection = await adminCollectionApi.createCollection(data);

      toast.success("Collection created successfully");
      await fetchCollections(); // Refetch to update list

      return newCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create collection";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (id: number, data: UpdateCollectionData) => {
    try {
      setLoading(true);

      const updatedCollection = await adminCollectionApi.updateCollection(
        id,
        data
      );

      toast.success("Collection updated successfully");
      await fetchCollections(); // Refetch to update list

      return updatedCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update collection";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id: number) => {
    try {
      setLoading(true);

      await adminCollectionApi.deleteCollection(id);

      toast.success("Collection deleted successfully");
      await fetchCollections(); // Refetch to update list
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete collection";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignProducts = async (id: number, productIds: number[]) => {
    try {
      setLoading(true);

      const updatedCollection = await adminCollectionApi.assignProducts(id, {
        productIds,
      });

      toast.success("Products assigned successfully");
      await fetchCollections(); // Refetch to update list

      return updatedCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to assign products";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeProducts = async (id: number, productIds: number[]) => {
    try {
      setLoading(true);

      const updatedCollection = await adminCollectionApi.removeProducts(id, {
        productIds,
      });

      toast.success("Products removed successfully");
      await fetchCollections(); // Refetch to update list

      return updatedCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to remove products";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (id: number, files: File[]) => {
    try {
      setLoading(true);

      const updatedCollection = await adminCollectionApi.uploadImages(
        id,
        files
      );

      toast.success("Images uploaded successfully");
      await fetchCollections(); // Refetch to update list

      return updatedCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload images";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (id: number, imageId: number) => {
    try {
      setLoading(true);

      const updatedCollection = await adminCollectionApi.removeImage(
        id,
        imageId
      );

      toast.success("Image removed successfully");
      await fetchCollections(); // Refetch to update list

      return updatedCollection;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to remove image";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const refetch = (newFilters?: CollectionFilters) => {
    return fetchCollections(newFilters);
  };

  return {
    collections,
    pagination,
    loading,
    error,
    refetch,
    createCollection,
    updateCollection,
    deleteCollection,
    assignProducts,
    removeProducts,
    uploadImages,
    removeImage,
  };
}
