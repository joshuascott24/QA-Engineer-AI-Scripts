declare module 'sentiment' {
    export default class Sentiment {
        analyze(text: string): { score: number };
    }
}
