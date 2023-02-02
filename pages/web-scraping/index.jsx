import { UseCaseWrapper } from '../../client/components/use-case-wrapper';

export const WebScrapingUseCase = () => {
  return (
    <>
      <UseCaseWrapper
        title="Web Scraping Prevention"
        description={`
            Web scraping is the process of extracting data from websites.
            It is a powerful tool for data scientists and researchers, 
            but it can also be used for malicious purposes. 
            In this use case, we will show how to prevent web scraping with Fingerprint Pro
        `}
        articleURL="https://fingerprintjs.com/blog/web-scraping-prevention/"
        listItems={[
            <>In this demo we will do something fun</>
        ]
        }
      >
        <h1>Ayo</h1>

      </UseCaseWrapper>
    </>
  );
};

export default WebScrapingUseCase;
