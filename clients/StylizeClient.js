import RNFetchBlob from "rn-fetch-blob";

export default async (fileUri, style) => {
  const photo = {
    uri: fileUri,
    type: "image/jpeg",
    name: "photo.jpg",
  };
  const form = new FormData();
  form.append("file", photo);
  form.append("style", style);

  const base64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEX///+nxBvIAAAASElEQVR4nO3BgQAAAADDoPlTX+AIVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwDcaiAAFXD1ujAAAAAElFTkSuQmCC";

  return RNFetchBlob.fetch(
    "POST",
    "http://127.0.0.1:8000/api/stylize/",
    {
      "Content-Type": "multipart/form-data",
    },
    [
      {
        name: "file",
        filename: "image.png",
        type: "image/png",
        data: base64,
      },
      { name: "style", data: style },
    ]
  )
    .then((res) => {
      console.log("----------------RESPONSE----------------");
      console.log(res.info());
      console.log("----------------RESPONSE----------------");
    })
    .catch((error) => {
      //   Alert.alert(
      //     "Error",
      //     "Please check your internet connection and try again",
      //     [{ text: "OK" }],
      //     { cancelable: false }
      //   );
    });
};
