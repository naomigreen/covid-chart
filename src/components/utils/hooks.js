import { useState, useEffect } from "react";
import axios from "axios";

export const useFetch = (url, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(url);
      setData(result.data);
    };
    try {
      fetchData();
    } catch (e) {
      setErrorMsg(e.message);
    }
  }, [url]);
  if (errorMsg) {
    console.log(errorMsg);
  }

  return data;
};
