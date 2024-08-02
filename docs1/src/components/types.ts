export interface ModulesData {
  meta: {
    registry: string;
  };
  list: Array<{
    name: string;
    description: string;
    repository?: string;
  }>;
}

export interface NpmRequester {
  name: string;
  'dist-tags': {
    latest: string;
  };
  versions: Record<
    string,
    {
      dist: {
        tarball: string;
        fileCount: number;
        unpackedSize: number;
      };
      dependencies?: Record<string, string>;
      // peerDependencies?: Record<string, string>;
    }
  >;
  time: {
    created: string;
    modified: string;
  };
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  keywords?: string[];
  // license?: string;
  readme?: string;
}

export interface DataDetails {
  meta: {
    registry: string;
    total: number;
    time: number;
  };
  list: Array<DataDetail>;
}

export interface DataDetail {
  name: string;
  description: string;
  version: string;
  keywords: string[];
  readme?: string;
  author: {
    name: string;
    email: string;
  };
  time: {
    created: number;
    modified: number;
  };
  dist: {
    dependencies: number;
    tarball: string;
    fileCount: number;
    unpackedSize: number;
  };
  repository?: string;
  category: Array<'adapter' | 'plugin' | 'official'>;
}
