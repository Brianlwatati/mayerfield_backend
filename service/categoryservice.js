import { CategoryRepository } from "../repository/categoryrepository.js";

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories() {
    return await this.categoryRepository.listCategories();
  }

  async getCategoryById(id) {
    const category = await this.categoryRepository.getCategoryById(id);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async createCategory(categoryData) {
    if (!categoryData.name) {
      const error = new Error("Category name is required");
      error.statusCode = 400;
      throw error;
    }
    return await this.categoryRepository.createCategory(categoryData);
  }

  async updateCategory(id, categoryData) {
    const updatedCategory = await this.categoryRepository.updateCategory(
      id,
      categoryData,
    );
    if (!updatedCategory) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
    return updatedCategory;
  }

  async deleteCategory(id) {
    const deletedCategory = await this.categoryRepository.deleteCategory(id);
    if (!deletedCategory) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
    return deletedCategory;
  }
}
