import { supabase } from "../config/supabase";
import { Product } from "../types/database";

export class ProductsRepository {

  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return (data as Product[]) || [];
  }

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return null;
    }

    return data as Product;
  }

}
