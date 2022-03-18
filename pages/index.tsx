import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Chromium from "chrome-aws-lambda";
import axios from "axios";

const Home: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  async function what() {
    try {
      const test = await fetch("http://www.gbfh.co.kr/", {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "upgrade-insecure-requests": "1",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      console.log(test);
    } catch (e) {
      console.log(e);
    }
  }
  what();
  return <pre>{JSON.stringify(props.page, null, 2)}</pre>;
};
export default Home;

const getStaticProps: GetStaticProps = async (context) => {
  const browser = await Chromium.puppeteer.launch({
    args: [...Chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: Chromium.defaultViewport,
    executablePath: await Chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto("http://www.gbfh.co.kr/0206/cafeteria/menu/");

  const info = await page.$eval(".table-board tbody", (el) => {
    const today = new Date(Date.now()).getUTCDay();
    const tomorrow = new Date(Date.now() + 86400000).getUTCDay();

    const meals = ["breakfast", "lunch", "dinner"];
    const twoDaysInfoRaw = [
      Array.from(el.children)[today],
      Array.from(el.children)[tomorrow],
    ];

    const mealsInfoRaw = twoDaysInfoRaw.map((day) =>
      meals.map((meal) => day.querySelector(`tr td[data-mqtitle='${meal}']`))
    );

    const mealsInfo = mealsInfoRaw.map((dayMealRaw) =>
      dayMealRaw.map((mealRaw) =>
        mealRaw?.innerHTML.replace("\n\t\t\t\t\t\t\t\t\t\t\t", "").split("<br>")
      )
    );

    return mealsInfo;
  });
  await browser.close();

  return {
    props: { page: info },
    revalidate: 3600,
  };
};
