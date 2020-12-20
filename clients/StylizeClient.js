export default async (fileUri, style) => {
  const photo = {
    uri: fileUri,
    type: "image/jpeg",
    name: "photo.jpg",
  };
  const form = new FormData();
  form.append("file", photo);
  form.append("style", style);

  console.log(fileUri, style);

  return fetch("http://127.0.0.1:8000/api/stylize/", {
    body: form,
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((response) => response.blob())
    .then((image) => URL.createObjectURL(image))
    .catch((error) => {
      //   Alert.alert(
      //     "Error",
      //     "Please check your internet connection and try again",
      //     [{ text: "OK" }],
      //     { cancelable: false }
      //   );
    });
};
