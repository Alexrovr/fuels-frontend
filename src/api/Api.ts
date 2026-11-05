/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum ModelsFuelStatus {
  FuelStatusDraft = "черновик",
  FuelStatusPublished = "опубликован",
  FuelStatusDeleted = "удален",
}

export interface SerializersDeleteFuelResponse {
  /** @example 7 */
  fuel_id?: number;
  /** @example "Карточка переведена в статус «удален»" */
  message?: string;
}

export interface SerializersErrorResponse {
  /** @example "Текст ошибки" */
  error?: string;
}

export interface SerializersFuelDetail {
  combustion_note?: string;
  created_at?: string;
  /**
   * CreatorLogin — логин автора плоским полем: вложенный объект пользователя
   * клиенту не нужен
   */
  creator_login?: string;
  formed_at?: string;
  fuel_id?: number;
  fuel_name?: string;
  fuel_status?: ModelsFuelStatus;
  heat_of_combustion_kj?: number;
  ignition_temp_c?: number;
  image_url?: string;
  /**
   * IsLiked — текущий пользователь лайкнул карточку: в ленте по нему
   * закрашивается сердечко
   */
  is_liked?: boolean;
  likes_count?: number;
  video_url?: string;
}

export interface SerializersFuelListItem {
  fuel_id?: number;
  fuel_name?: string;
  heat_of_combustion_kj?: number;
  ignition_temp_c?: number;
  image_url?: string;
  /**
   * IsMine — карточку создал текущий пользователь: в плитке по нему
   * показывается кнопка удаления
   */
  is_mine?: boolean;
  likes_count?: number;
}

export interface SerializersLikeRequest {
  /** @example 1 */
  like?: 0 | 1;
}

export interface SerializersLikeResponse {
  fuel_id?: number;
  is_liked?: boolean;
  likes_count?: number;
}

export interface SerializersLoginRequest {
  /** @example "ivanov" */
  login?: string;
  /** @example "heat12345" */
  password?: string;
}

export interface SerializersLoginResponse {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  access_token?: string;
  /**
   * секунд
   * @example 3600
   */
  expires_in?: number;
  /** @example "Bearer" */
  token_type?: string;
  user?: SerializersUserShort;
}

export interface SerializersMessageResponse {
  /** @example "Выход выполнен: токен добавлен в чёрный список" */
  message?: string;
}

export interface SerializersPublishFuelRequest {
  /** @example "Этилен сгорает коптящим светящимся пламенем." */
  combustion_note?: string;
  /** @example 59000 */
  heat_of_combustion_kj?: number;
  /** @example 450 */
  ignition_temp_c?: number;
}

export interface SerializersRegisterRequest {
  /** @example "Сидоров Алексей" */
  full_name?: string;
  /** @example "sidorov" */
  login?: string;
  /** @example "heat54321" */
  password?: string;
}

export interface SerializersUserShort {
  /** @example "Иванов Иван" */
  full_name?: string;
  /** @example "ivanov" */
  login?: string;
  /** @example 1 */
  user_id?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:3030/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Расчёт теплоты сгорания — веб-сервис
 * @version 4.0
 * @baseUrl http://localhost:3030/api
 * @contact
 *
 * JSON API справочника видов топлива для SPA (ЛР4).
 * Гость: только чтение — список, лента. Создатель (после входа): черновик, добавление, публикация, удаление, лайк, выход.
 * Вход: POST /users/login → скопировать access_token → кнопка Authorize → «Bearer <токен>».
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  fuels = {
    /**
     * @description Опубликованные карточки с фильтром по нижней границе теплоты сгорания. Доступно гостю без токена; токен необязателен — с ним дополнительно заполняется is_mine.
     *
     * @tags Услуги — виды топлива
     * @name FuelsList
     * @summary Список видов топлива (плитка)
     * @request GET:/fuels
     * @secure
     */
    fuelsList: (
      query?: {
        /**
         * Теплота сгорания не меньше, кДж/м³
         * @min 0
         */
        min_heat?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializersFuelListItem[], SerializersErrorResponse>({
        path: `/fuels`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Черновик; создатель (creator_id) — пользователь из JWT. Файлы — в Minio под латинскими именами.
     *
     * @tags Услуги — виды топлива
     * @name FuelsCreate
     * @summary Добавление вида топлива с изображением и видео
     * @request POST:/fuels
     * @secure
     */
    fuelsCreate: (
      data: {
        /** Название, 1–128 символов */
        fuel_name: string;
        /**
         * Изображение jpeg/png/gif/webp/svg, ≤ 5 МБ
         * @format binary
         */
        image: File;
        /**
         * Видео mp4/webm, ≤ 30 МБ
         * @format binary
         */
        video: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializersFuelDetail, SerializersErrorResponse>({
        path: `/fuels`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Ид не указывается: черновик ищется по пользователю из JWT.
     *
     * @tags Услуги — виды топлива
     * @name DraftList
     * @summary Черновик текущего пользователя
     * @request GET:/fuels/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<SerializersFuelDetail, SerializersErrorResponse>({
        path: `/fuels/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Первая опубликованная карточка. Доступно гостю без токена; токен необязателен — с ним дополнительно заполняется is_liked.
     *
     * @tags Услуги — виды топлива
     * @name FeedList
     * @summary Лента: первая карточка
     * @request GET:/fuels/feed
     * @secure
     */
    feedList: (params: RequestParams = {}) =>
      this.request<SerializersFuelDetail, SerializersErrorResponse>({
        path: `/fuels/feed`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description С next=true — следующая опубликованная после fuel_id (по кругу). Доступно гостю без токена; токен необязателен — с ним дополнительно заполняется is_liked.
     *
     * @tags Услуги — виды топлива
     * @name FeedDetail
     * @summary Лента: карточка по ид или следующая за ней
     * @request GET:/fuels/feed/{fuel_id}
     * @secure
     */
    feedDetail: (
      fuelId: number,
      query?: {
        /** true — следующая карточка */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializersFuelDetail, SerializersErrorResponse>({
        path: `/fuels/feed/${fuelId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Статус → удален, строка остаётся в БД. Только создатель карточки.
     *
     * @tags Услуги — виды топлива
     * @name FuelsDelete
     * @summary Удаление вида топлива (логическое)
     * @request DELETE:/fuels/{fuel_id}
     * @secure
     */
    fuelsDelete: (fuelId: number, params: RequestParams = {}) =>
      this.request<SerializersDeleteFuelResponse, SerializersErrorResponse>({
        path: `/fuels/${fuelId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 1 — поставить лайк от пользователя из JWT, 0 — отменить. Только опубликованные карточки.
     *
     * @tags Услуги — виды топлива
     * @name LikeCreate
     * @summary Лайк
     * @request POST:/fuels/{fuel_id}/like
     * @secure
     */
    likeCreate: (
      fuelId: number,
      body: SerializersLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializersLikeResponse, SerializersErrorResponse>({
        path: `/fuels/${fuelId}/like`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description черновик → опубликован, дозаполняет описание и два поля по теме; formed_at ставит бэкенд. Гость — 401, не создатель — 403.
     *
     * @tags Услуги — виды топлива
     * @name PublishUpdate
     * @summary Публикация черновика
     * @request PUT:/fuels/{fuel_id}/publish
     * @secure
     */
    publishUpdate: (
      fuelId: number,
      body: SerializersPublishFuelRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializersFuelDetail, SerializersErrorResponse>({
        path: `/fuels/${fuelId}/publish`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Возвращает JWT. Его нужно передавать в заголовке Authorization: Bearer <access_token> (в Swagger — кнопка Authorize).
     *
     * @tags Пользователи
     * @name LoginCreate
     * @summary Аутентификация (вход)
     * @request POST:/users/login
     */
    loginCreate: (body: SerializersLoginRequest, params: RequestParams = {}) =>
      this.request<SerializersLoginResponse, SerializersErrorResponse>({
        path: `/users/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Текущий JWT попадает в чёрный список Redis (ключ heat_fuels.jwt.<jti>) до истечения срока; дальше с ним 401.
     *
     * @tags Пользователи
     * @name LogoutCreate
     * @summary Деавторизация (выход)
     * @request POST:/users/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<SerializersMessageResponse, SerializersErrorResponse>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Логин латиницей 3–64 символа, ФИО, пароль 6–72 символа. В БД — bcrypt-хэш пароля.
     *
     * @tags Пользователи
     * @name RegisterCreate
     * @summary Регистрация
     * @request POST:/users/register
     */
    registerCreate: (
      body: SerializersRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializersUserShort, SerializersErrorResponse>({
        path: `/users/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
