// import type { IGetByQueryUseCase } from '@application/interfaces/IGetByQueryUseCase';
// import { useQuery } from '@tanstack/react-query';

// import container from '@presentation/di';
// import { UserConfig } from '@domain/entities/ProfileData';

// export const useGetByQuery = (token: string) => {
//     const getByQueryUseCase = container.resolve<IGetByQueryUseCase>("IGetByQueryUseCase");

//     const fetchData = async () => {
//         const payload: string = "";
//         return await getByQueryUseCase.execute(payload, token);
//     };

//     const { data, isLoading, isError, error } = useQuery<UserConfig, Error>({
//         queryKey: ["fetch-getByQuery", token], // Token in queryKey for auto-refetching
//         queryFn: fetchData,
//         staleTime: 1000 * 60 * 5,
//         retry: 3,
//         enabled: !!token, // Ensures query only runs when token is available
//     });

//     return { data, isLoading, isError, error };
// };
