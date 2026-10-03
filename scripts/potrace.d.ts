declare module "potrace" {
  type Options = {
    turdSize?: number;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    threshold?: number;
    blackOnWhite?: boolean;
  };
  const potrace: {
    trace(input: Buffer, options: Options, callback: (error: Error | null, svg: string) => void): void;
  };
  export default potrace;
}
