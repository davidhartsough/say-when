import cities from "./cities";

export type CityOption = {
  city: string;
  country: string;
  search: string[];
  link: string;
  tz: string;
};

export type CityOptions = typeof cities;

export function getCityById(id: string): CityOption | undefined {
  return cities.find(({ link }) => link === id);
}

export function searchCities(inputLowerCase: string): CityOptions {
  return cities.filter(({ search }) =>
    search.some((t) => t.startsWith(inputLowerCase)),
  );
}
