export interface Category {
    id?: string;
    name?: string;
    description?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category | Category[];
    total?: number;
}

export interface CategoryCreateRequest {
    name: string;
    description?: string;
    active?: boolean;
}

export interface CategoryUpdateRequest {
    name?: string;
    description?: string;
    active?: boolean;
}
