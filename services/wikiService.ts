
export const fetchCityImage = async (cityName: string): Promise<string | null> => {
  try {
    // We use pithumbsize=1000 to get a high quality image
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      cityName
    )}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;

    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query?.pages;

    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;

    const thumbnail = pages[pageId]?.thumbnail;
    return thumbnail?.source || null;
  } catch (error) {
    console.error("Error fetching Wiki image:", error);
    return null;
  }
};
