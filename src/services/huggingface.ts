import axios, { AxiosRequestConfig } from 'axios';

import {
    DatasetDetails,
    DatasetSummary,
    ModelDetails,
    ModelFile,
    ModelSummary,
    SearchParams,
} from '../types';

const HUGGING_FACE_API_BASE = 'https://huggingface.co/api';
const HUGGING_FACE_RAW_BASE = 'https://huggingface.co';

type ApiHeaders = Record<string, string>;

function buildHeaders(token?: string): ApiHeaders {
    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

async function get<T>(
    path: string,
    token?: string,
    params?: Record<string, unknown>,
): Promise<T> {
    const config: AxiosRequestConfig = {
        headers: buildHeaders(token),
        params,
    };

    const response = await axios.get<T>(`${HUGGING_FACE_API_BASE}${path}`, config);
    return response.data;
}

function mapModelSummary(model: Record<string, unknown>): ModelSummary {
    const safeValue = <T>(value: unknown, fallback: T): T => (value === undefined || value === null ? fallback : (value as T));

    return {
        id: safeValue(model.modelId ?? model.id, ''),
        pipelineTag: safeValue<string | null>(model.pipeline_tag ?? null, null),
        downloads: safeValue<number | undefined>(model.downloads, undefined),
        likes: safeValue<number | undefined>(model.likes, undefined),
        tags: safeValue<string[] | undefined>(model.tags as string[] | undefined, undefined),
        private: safeValue<boolean | undefined>(model.private as boolean | undefined, undefined),
        author: safeValue<string | null>(model.author as string | null, null),
        lastModified: safeValue<string | undefined>(
            (model.lastModified as string | undefined) ?? (model.last_modified as string | undefined),
            undefined,
        ),
        libraryName: safeValue<string | null>(model.library_name as string | null, null),
        description: safeValue<string | null>(model.description as string | null, null),
    };
}

function mapModelFile(file: Record<string, unknown>): ModelFile {
    const fileName = (file.rfilename as string | undefined)
        ?? (file.path as string | undefined)
        ?? (file.filename as string | undefined)
        ?? '';

    return {
        rfilename: fileName,
        size: file.size as number | undefined,
        sha: (file.sha as string | undefined) ?? (file.blobId as string | undefined),
        downloadUrl: file.downloadUrl as string | undefined,
        raw: file.raw as string | undefined,
    };
}

function mapDatasetSummary(dataset: Record<string, unknown>): DatasetSummary {
    const safeValue = <T>(value: unknown, fallback: T): T => (value === undefined || value === null ? fallback : (value as T));

    return {
        id: safeValue(dataset.id ?? dataset._id, ''),
        downloads: safeValue<number | undefined>(dataset.downloads, undefined),
        likes: safeValue<number | undefined>(dataset.likes, undefined),
        tags: safeValue<string[] | undefined>(dataset.tags as string[] | undefined, undefined),
        private: safeValue<boolean | undefined>(dataset.private as boolean | undefined, undefined),
        author: safeValue<string | null>(dataset.author as string | null, null),
        lastModified: safeValue<string | undefined>(
            (dataset.lastModified as string | undefined) ?? (dataset.last_modified as string | undefined),
            undefined,
        ),
        description: safeValue<string | null>(dataset.description as string | null, null),
    };
}

export async function searchModels({ query, limit = 10, token }: SearchParams): Promise<ModelSummary[]> {
    const data = await get<Record<string, unknown>[]>(
        '/models',
        token,
        {
            search: query,
            limit,
            sort: 'downloads',
        },
    );

    return data.map(mapModelSummary);
}

export async function searchDatasets({ query, limit = 10, token }: SearchParams): Promise<DatasetSummary[]> {
    const data = await get<Record<string, unknown>[]>(
        '/datasets',
        token,
        {
            search: query,
            limit,
            sort: 'downloads',
        },
    );

    return data.map(mapDatasetSummary);
}

export async function getModelDetails(modelId: string, token?: string): Promise<ModelDetails> {
    const data = await get<Record<string, unknown>>(`/models/${modelId}`, token);
    const summary = mapModelSummary(data);
    const siblings = Array.isArray(data.siblings) ? data.siblings.map((sibling) => mapModelFile(sibling as Record<string, unknown>)) : [];

    return {
        ...summary,
        cardData: (data.cardData as Record<string, unknown> | undefined) ?? null,
        siblings,
    };
}

export async function getModelReadme(modelId: string, token?: string): Promise<string | null> {
    try {
        const data = await get<Record<string, unknown>>(`/models/${modelId}/readme`, token);
        const content = data.content as string | undefined;
        if (content && typeof content === 'string') {
            return content;
        }
        return null;
    } catch (error) {
        // Many models omit README endpoints; fall back to raw file fetch before giving up.
        try {
            const rawResponse = await axios.get<string>(
                `${HUGGING_FACE_RAW_BASE}/${modelId}/raw/main/README.md`,
                {
                    headers: buildHeaders(token),
                    responseType: 'text',
                },
            );
            if (typeof rawResponse.data === 'string' && rawResponse.data.trim().length) {
                return rawResponse.data;
            }
        } catch (rawError) {
            // Ignore raw fetch errors; we'll return null below.
        }

        return null;
    }
}

export async function getDatasetDetails(datasetId: string, token?: string): Promise<DatasetDetails> {
    const data = await get<Record<string, unknown>>(`/datasets/${datasetId}`, token);
    const summary = mapDatasetSummary(data);

    return {
        ...summary,
        cardData: (data.cardData as Record<string, unknown> | undefined) ?? null,
    };
}

export function buildModelFileDownloadUrl(modelId: string, fileName: string, revision = 'main'): string {
    return `${HUGGING_FACE_API_BASE}/models/${modelId}/resolve/${revision}/${fileName}`;
}

export function buildDatasetFileDownloadUrl(datasetId: string, fileName: string, revision = 'main'): string {
    return `${HUGGING_FACE_API_BASE}/datasets/${datasetId}/resolve/${revision}/${fileName}`;
}
