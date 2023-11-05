const span = <HTMLSpanElement>document.getElementById("approx-loc");

const backupKey = "my-approx-loc";
const getBackup = () => window.sessionStorage.getItem(backupKey) || null;
const setBackup = (val: string) =>
  window.sessionStorage.setItem(backupKey, val);

function setText(text: string) {
  span.innerText = text;
}

if (span && span.innerText === "...") {
  const backup = getBackup();
  if (backup) {
    setText(backup);
  } else {
    fetch("https://geolocation-db.com/json/")
      .then((res) => res.json())
      .then(({ city }) => {
        if (city && typeof city === "string" && city.length > 0) {
          const approxLoc = `(near ${city})`;
          setBackup(approxLoc);
          setText(approxLoc);
        } else {
          setText("");
        }
      })
      .catch(() => setText(""));
  }
}
