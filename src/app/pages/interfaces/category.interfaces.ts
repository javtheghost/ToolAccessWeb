export interface Category {
    id?: number;
    nombre?: string;
    descripcion?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
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
