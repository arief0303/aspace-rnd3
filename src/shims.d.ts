declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
  }
  
  interface ImportMeta {
    env: {
      BASE_URL: string
    }
  }