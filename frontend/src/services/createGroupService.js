import axios from "../api/axios";

export const createGroup = async (
  groupData,
  token
) => {
  const response = await axios.post(
    "/groups",
    groupData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};