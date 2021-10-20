import { DvelopContext, DmsObject } from "../../index";
import { HttpResponse } from "../../internals";
import { getDmsObjectMainFile, getDmsObjectPdfFile } from "../get-dms-object-file/get-dms-object-file";
import { GetDmsObjectParams, getDmsObjectFactory, getDmsObjectDefaultTransformFunction } from "../get-dms-object/get-dms-object";

jest.mock("../get-dms-object-file/get-dms-object-file");
const mockGetDmsObjectMainFile = getDmsObjectMainFile as jest.MockedFunction<typeof getDmsObjectMainFile>;
const mockGetDmsObjectPdfFile = getDmsObjectPdfFile as jest.MockedFunction<typeof getDmsObjectPdfFile>;

describe("getDmsObject", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetDmsObjectParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };
  });

  it("should make correct request", async () => {

    const getDmsObject = getDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
    await getDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.dmsObjectId
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getDmsObject = getDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
    await getDmsObject(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getDmsObjectDefaultTransformFunction", () => {

    it("should map correctly on no file links", async () => {

      const data: any = {
        "_links": {
          "HiItsMeLink": {
            "href": "HiItsMeLinkHref"
          },

        },
        "id": "HiItsMeId",
        "sourceProperties": [
          {
            "key": "HiItsMeSourcePropertyId1",
            "value": "HiItsMeSourcePropertyValue1"
          },
          {
            "key": "HiItsMeSourcePropertyId2",
            "value": "HiItsMeSourcePropertyValue2"
          }
        ],
        "sourceCategories": [
          "HiItsMeSourceCategoriyId1",
          "HiItsMeSourceCategoriyId2"
        ]
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const getDmsObject = getDmsObjectFactory(mockHttpRequestFunction, getDmsObjectDefaultTransformFunction);
      const result: DmsObject = await getDmsObject(context, params);

      expect(result).toHaveProperty("repositoryId", params.repositoryId);
      expect(result).toHaveProperty("sourceId", params.sourceId);
      expect(result).toHaveProperty("id", params.dmsObjectId);
      expect(result).toHaveProperty("properties", data["sourceProperties"]);
      expect(result).toHaveProperty("categories", data["sourceCategories"]);


      expect(result).not.toHaveProperty("getMainFile");
      expect(result).not.toHaveProperty("getPdfFile");
    });

    it("should set getMainFile correctly", async () => {

      const data: any = {
        "_links": {
          "mainblobcontent": {
            "href": "HiItsMeMainBlobContentHref"
          },
        },
        "id": "HiItsMeId",
        "sourceProperties": [],
        "sourceCategories": [ ]
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);
      const mainFile: ArrayBuffer = new ArrayBuffer(42);
      mockGetDmsObjectMainFile.mockResolvedValue(mainFile);

      const getDmsObject = getDmsObjectFactory(mockHttpRequestFunction, getDmsObjectDefaultTransformFunction);
      const result: DmsObject = await getDmsObject(context, params);

      expect(result.getMainFile).toEqual(expect.any(Function));

      const resultFile: ArrayBuffer = await result.getMainFile();
      expect(mockGetDmsObjectMainFile).toHaveBeenCalledTimes(1);
      expect(mockGetDmsObjectMainFile).toHaveBeenCalledWith(context, params);
      expect(resultFile).toBe(mainFile);
    });

    it("should set getPdfFile correctly", async () => {

      const data: any = {
        "_links": {
          "pdfblobcontent": {
            "href": "HiItsMePdfBlobContentHref"
          },
        },
        "id": "HiItsMeId",
        "sourceProperties": [],
        "sourceCategories": [ ]
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);
      const pdfFile: ArrayBuffer = new ArrayBuffer(42);
      mockGetDmsObjectPdfFile.mockResolvedValue(pdfFile);

      const getDmsObject = getDmsObjectFactory(mockHttpRequestFunction, getDmsObjectDefaultTransformFunction);
      const result: DmsObject = await getDmsObject(context, params);

      expect(result.getPdfFile).toEqual(expect.any(Function));

      const resultFile: ArrayBuffer = await result.getPdfFile();
      expect(mockGetDmsObjectPdfFile).toHaveBeenCalledTimes(1);
      expect(mockGetDmsObjectPdfFile).toHaveBeenCalledWith(context, params);
      expect(resultFile).toBe(pdfFile);
    });
  });
});
