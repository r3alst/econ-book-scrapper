export type BotConfig = {
  chapters: {
    title: string,
    link: string,
    processed: boolean,
    pointer?: string // pointer that store paragraph, question etc to resume progress
    subChapters?: {
      id: string, // link
      title: string,
      proceseed: boolean,
      pointer?: string // pointer that store paragraph, question etc to resume progress
    }[]
  }[], 
}

export type PreBookNodeType = "figure" | "reference" | "paragraph";
export type PreBookNodeChunkType = "reference" | "paragraph" | "video" | "svg" | "image" | "table" | "blockquote";

export type PreBookNodeChunk = {
  type: PreBookNodeType,
  url?: string,
  content?: string,
  id?: string,
  classes?: string[]
};

export type PreBookNode = {
  title?: string,
  chunks: PreBookNodeChunk[], // it may contain only one chunk or 2
  type: PreBookNodeType,
  order: number, // order can be used to process things cronologically
  
}