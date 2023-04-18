export interface DemoAppTestConfig {
    basedir: string;
    title: string;
    fixtureName: string;
    urlPath: string;
}
export declare const createVerifyDemoAppTest: ({ basedir, title, urlPath, fixtureName, }: DemoAppTestConfig) => Promise<void>;
