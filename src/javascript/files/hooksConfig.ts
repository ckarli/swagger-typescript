const getHooksConfigFile = () => `/**
 * You can modify this file
 *
 * @version ${require("../../../package.json").version.split(".")[0]}
 */
import {SwaggerResponse} from "./config";


type GetDataType<
  T extends Array<SwaggerResponse<any>>,
  K extends string = "data" | "list"
> = T extends Array<SwaggerResponse<infer D>>
  ? D extends {
      [P in K]?: infer R1;
    }
    ? R1
    : D extends Array<any>
    ? D
    : never
  : never;

const paginationFlattenData = <T extends Array<SwaggerResponse<any>>>(
  pages?: T,
): GetDataType<T> | undefined =>
  pages?.flatMap((page) =>
    Array.isArray(page.data)
      ? page.data
      : Array.isArray(page.data?.data)
      ? page.data.data
      : Array.isArray(page.data?.list)
      ? page.data.list
      : [],
  ) as any;

const getTotal = <T extends Array<SwaggerResponse<any>>>(
  pages?: T,
): number | undefined => {
  return pages && pages[pages.length - 1]?.data?.total;
};


const getPageSize = (queryParams?: any): number | undefined => {
  const pageSize = Object.entries(queryParams || {}).find(([key, _value]) => {
    if (
      key.toLowerCase() === "pagesize" ||
      key.toLowerCase() === "pagenumber"
    ) {
      return true;
    }
    return false;
  });

  return (pageSize?.[1] || 10) as number;
};

export {
  paginationFlattenData,
  getTotal,
  getPageSize,
};`;

export default getHooksConfigFile;