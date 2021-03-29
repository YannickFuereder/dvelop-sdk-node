import axios from "axios";
import { createTask } from "./create-task";
import { Task } from "../task";

jest.mock("axios");

describe("createTask", () => {

    const mockedAxios = axios as jest.Mocked<typeof axios>;
  
    beforeEach(() => {
      mockedAxios.post.mockReset();
      mockedAxios.post.mockResolvedValue({headers: {
        location: "/task/tasks/12345"
      }});
    });

    let task:Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };
  
    it("should make POST with correct URI", async () => {
  
      const systemBaseUri = "HiItsMeSystemBaseUri";
  
      await createTask(systemBaseUri, "HiItsMeAuthSessionId", task);
  
      expect(mockedAxios.post).toBeCalledWith(`${systemBaseUri}/task/tasks`, expect.any(Object), expect.any(Object));
    });

    it("should make POST with correct headers", async () => {

      const authessionId = "HiItsMeAuthsessionId";
      const systemBaseUri = "HiItsMeSystemBaseUri";
  
      await createTask(systemBaseUri, authessionId, task);
  
      expect(mockedAxios.post).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
    });

    it("should make POST with correct body", async () => {

      const authessionId = "HiItsMeAuthsessionId";
      const systemBaseUri = "HiItsMeSystemBaseUri";
  
      await createTask(systemBaseUri, authessionId, task);
  
      expect(mockedAxios.post).toBeCalledWith(expect.any(String), task ,expect.any(Object));
    });
  });