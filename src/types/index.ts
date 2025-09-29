export interface ModelSummary {
    id: string;
    pipelineTag?: string | null;
    downloads?: number;
    likes?: number;
    tags?: string[];
    private?: boolean;
    author?: string | null;
    lastModified?: string;
    libraryName?: string | null;
    description?: string | null;
}

export interface ModelFile {
    rfilename: string;
    size?: number;
    sha?: string;
    downloadUrl?: string;
    raw?: string;
}

export interface ModelCardData {
    license?: string;
    language?: string | string[];
    datasets?: string | string[];
    tags?: string[];
    summary?: string;
    [key: string]: unknown;
}

export interface ModelDetails extends ModelSummary {
    cardData?: ModelCardData | null;
    siblings?: ModelFile[];
    readme?: string | null;
}

export interface DatasetSummary {
    id: string;
    downloads?: number;
    likes?: number;
    tags?: string[];
    private?: boolean;
    author?: string | null;
    lastModified?: string;
    description?: string | null;
}

export interface DatasetDetails extends DatasetSummary {
    cardData?: Record<string, unknown> | null;
}

export interface SearchParams {
    query: string;
    limit?: number;
    token?: string;
}

export interface FileDownloadOptions {
    modelId: string;
    fileName: string;
    destinationFolder: string;
    token?: string;
}
