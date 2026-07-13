declare module 'react-native-fs' {
  const RNFS: {
    readFile(path: string, encoding?: string): Promise<string>;
  };

  export default RNFS;
}
