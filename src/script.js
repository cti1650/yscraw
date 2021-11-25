function _testCase() {
  mail({
    title: "React.js関連情報",
    itemList: search("React.js OR Next.js"),
  });
}

function mail(option = {}) {
  const defaultOption = {
    to: Session.getActiveUser().getUserLoginId(),
    title: "title",
    itemList: [],
    itemLayout: `<p><a href="{{url}}" alt="link">{{title}}</a></p>`,
    bodyLayout: `<h1>{{title}}</h1>
    <div>{{body}}</div>`,
  };
  const baseOption = { ...defaultOption, ...option };
  const arr = search(baseOption.title);
  const itemListBody = arr
    .map((item) => {
      if (item) {
        let itemLayoutStr = baseOption.itemLayout;
        Object.keys(item).forEach((key) => {
          itemLayoutStr = itemLayoutStr.replaceAll(
            `{{${key}}}`,
            item[key].toString()
          );
        });
        return itemLayoutStr;
      }
    })
    .filter((v) => v)
    .join("");
  const templateDataSet = {
    title: baseOption.title,
    body: itemListBody,
  };
  let body = baseOption.bodyLayout;
  Object.keys(templateDataSet).forEach((key) => {
    body = body.replaceAll(`{{${key}}}`, templateDataSet[key].toString());
  });
  MailApp.sendEmail({
    to: baseOption.to,
    subject: baseOption.title,
    htmlBody: body,
  });
}

function search(word, option = {}) {
  let result = [];
  const defaultOption = {
    x: "wrt",
    aq: -1,
    ai: "",
    ei: "UTF-8",
    vd: "w",
    pages: 2,
  };
  const baseOption = { ...defaultOption, ...option };
  const param = Object.keys(baseOption)
    .map((key) => {
      return `${key}=${encodeURI(baseOption[key])}`;
    })
    .join("&");
  const pageCount = baseOption.pages;
  const linkRegexp = /<a href=\"(.*?) .*?ping.*?>.*?<\/a>/gm;
  const urlRegexp = /href=\"(.*?)\"/;
  const titleRegexp = /<a .*?>(.*?)<\/a>/;
  [...new Array(pageCount)].forEach((value, index) => {
    try {
      const searchUrl =
        "https://search.yahoo.co.jp/search?p=" +
        encodeURI(word) +
        "&" +
        param +
        "&b=" +
        (index * 10 + 1);
      const response = UrlFetchApp.fetch(searchUrl);
      const elems = response.getContentText().match(linkRegexp);
      elems.forEach((elem) => {
        const url = elem.match(urlRegexp)[1];
        if (url === "https://www.yahoo.co.jp") return;
        const title = elem.match(titleRegexp)[1];
        result.push({
          url: url,
          title: title
            .replaceAll("<b>", "")
            .replaceAll("</b>", "")
            .replaceAll("<br>", ""),
        });
      });
    } catch (e) {
      Logger.log("NG count: " + index);
    }
  });
  return result;
}
