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

    interface EggAppConfig {
        nacos: {
            serverList: string, // nacos 地址，多个用逗号隔开
            client: {
                namespace: string, // 命名空间ID
                serviceName?: string, // 服务名称
                groupName?: string, // 分组
                username?: tring,
                password?: tring,
                [key: string]: any;
            },
            subscribers: {
                [key: string]: {
                    serviceName: string, // 服务名称
                    groupName?: string, // 默认 DEFAULT_GROUP
                    clusters?: string, // 默认 DEFAULT
                    subscribe?: Boolean, // 是否订阅  默认 true  
                },
            }
        };
        
    }
    
}
