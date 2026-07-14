import { supabase } from "../config/supabase";

export class ProductsRepository {

  async getAll() {

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    return data ?? [];
  }

}
