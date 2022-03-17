import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Chromium from "chrome-aws-lambda";

const Home: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  async function what() {
    try {
      const test = await fetch("http://www.gbfh.co.kr/0206/cafeteria/menu/");

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
