import "egg";
import { RequestOptions, HttpClientResponse } from "urllib";

interface NacosRequest {
    /**
     * 
     * @param url 
     * @param options https://www.npmjs.com/package/urllib#arguments
     */
    request(url: string, options?: RequestOptions): Promise<HttpClientResponse<any>>;
    pick(): Promise<any>;
    selectInstances(): Promise<any[]>;
}

declare module "egg" {
    interface Application {
        nacos: {
            [key: string]: NacosRequest;
        };
    }

    interface Context {
        nacos: {
            [key: string]: NacosRequest;
        };
    }
}
