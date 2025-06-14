// * para ser pragmáticos se utiliza zod para validar la url, es mejor que usar un regex simple
// * a futuro esto igual se puede cambiar sin que afecte a los demás módulos

import { z } from "zod";
const urlSchema = z.string().url();

type queryParameterType =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | (string | number | boolean)[];

// TODO: falta probar el código comentado...

export class AppUrl {
  private readonly url: string;
  private readonly queryParams: Record<string, queryParameterType | undefined> =
    {};

  constructor(baseUrl: string, ...paths: string[]) {
    // const pathComponents: string[] = [];

    // const normalizedAndAddPathComponent = (path: string) => {
    //   const pathSections = path.trim().split("/").filter(Boolean);
    //   if (pathSections.length > 0) pathComponents.push(...pathSections);
    // };

    // for (const path of paths) {
    //   const indexOfQuestionMark = path.indexOf("?");
    //   if (indexOfQuestionMark === -1) {
    //     normalizedAndAddPathComponent(path);
    //     continue;
    //   }

    //   const pathWithoutQueryParams = path.slice(0, indexOfQuestionMark);
    //   normalizedAndAddPathComponent(pathWithoutQueryParams);
    //   const queryStringParams = path.slice(indexOfQuestionMark);
    //   this.parseQueryString(queryStringParams);
    //   break;
    // }

    const pathComponents = paths.flatMap((path) =>
      // path puede tener el formato "miPath", "path1/path2"
      path.trim().split("/").filter(Boolean)
    );

    const normalizedPath = pathComponents.join("/");

    const urlToValidate = baseUrl.endsWith("/")
      ? `${baseUrl}${normalizedPath}`
      : [baseUrl, normalizedPath].filter(Boolean).join("/");

    this.ensureIsValid(urlToValidate);
    this.url = urlToValidate;
  }

  // private parseQueryString(queryString: string) {
  //   if (!queryString.startsWith("?")) throw new Error("Invalid query string");

  //   const queryWithoutQuestionMark = queryString.slice(1);
  //   const queryParams = queryWithoutQuestionMark.split("&");

  //   for (const param of queryParams) {
  //     const [key, value] = param.split("=");
  //     if (!key || !value) throw new Error("Invalid query param");
  //     this.query({ [key]: value });
  //   }
  // }

  // query(queryParams: Record<string, queryParameterType>): AppUrl {
  //   for (const key in queryParams) {
  //     if (!Object.prototype.hasOwnProperty.call(queryParams, key)) {
  //       throw new Error("Invalid query param");
  //     }
  //     const value = queryParams[key];
  //     const valueIsArray = Array.isArray(value);

  //     const currentValue = this.queryParams[key];
  //     const currentValueIsArray = Array.isArray(currentValue);

  //     if (!currentValue) {
  //       this.queryParams[key] = value;
  //       continue;
  //     }

  //     if (currentValue && currentValueIsArray) {
  //       if (valueIsArray) this.queryParams[key] = [...currentValue, ...value];
  //       else this.queryParams[key] = [...currentValue, value];
  //       continue;
  //     }

  //     if (valueIsArray) this.queryParams[key] = [currentValue, ...value];
  //     else this.queryParams[key] = [currentValue, value];
  //   }
  //   return this;
  // }

  static clone(url: AppUrl) {
    return new AppUrl(url.getValue());
  }

  private ensureIsValid(value: string) {
    const isUrlValid = urlSchema.safeParse(value).success;
    if (!isUrlValid) throw new Error("Invalid url");
  }

  getValue() {
    const finalUrl = this.url;
    const queryParamsCount = Object.keys(this.queryParams).length;
    if (queryParamsCount === 0) return finalUrl;

    const queryParamEntries = Object.entries(this.queryParams);
    const formattedQueryParams = queryParamEntries.map(([key, value]) => {
      const arrayValue = Array.isArray(value) ? value : [value];
      arrayValue.map((v) => [key, v].join("=")).join("&");
    });
    const concatenatedQueryString = formattedQueryParams.join("&");

    return `${finalUrl}?${concatenatedQueryString}`;
  }
}
