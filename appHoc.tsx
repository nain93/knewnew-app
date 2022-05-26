import React from 'react';
import { RecoilRoot } from 'recoil';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import App from '~/../App';

import axios from 'axios';

const AppHoc = () => {
  // * react query 글로벌 에러 핸들링 세팅
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.log(JSON.stringify(error.response.data));
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.log(JSON.stringify(error.response.data));
        }
      }
    })
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export default AppHoc;
