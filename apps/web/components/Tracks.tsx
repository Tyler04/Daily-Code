"use client";
import { TrackCard } from "./TrackCard";
import { category } from "@repo/store";
import { Track, Problem } from "@prisma/client";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@repo/ui";
import { getLastNavigatedTrackHistory } from "./utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Tracks extends Track {
  problems: Problem[];
  categories: {
    category: {
      id: string;
      category: string;
    };
  }[];
}

export const Tracks = ({ tracks }: { tracks: Tracks[] }) => {
  const session = useSession();
  const router = useRouter();
  const selectedCategory = useRecoilValue(category);
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [sortBy, setSortBy] = useState("");
  const filterTracks = () => {
    let filteredTracks = tracks;
    if (selectedCategory.length > 0) {
      filteredTracks = filteredTracks.filter((t) => t.categories.some((c) => c.category.category === selectedCategory));
    }
    setFilteredTracks(filteredTracks);
  };
  const sortTracks = (sortBy: string) => {
    let sortedTracks = [...filteredTracks];
    if (sortBy === "ascending") {
      sortedTracks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "descending") {
      sortedTracks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "new") {
      sortedTracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "old") {
      sortedTracks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    setFilteredTracks(sortedTracks);
  };
  const navigateToTrack = async (track: Tracks) => {
    if (session.data?.user) {
      let user: any = session.data.user;
      const userId = user.id;
      const lastTrack = await getLastNavigatedTrackHistory(userId, track.id);
      if (lastTrack) {
        const url = `/tracks/${track.id}/${lastTrack}`;
        router.push(url);
        return;
      }
    }
    router.push(`/tracks/${track.id}/${track.problems[0]?.id}`);
  };
  useEffect(() => {
    filterTracks();
  }, [selectedCategory]);
  useEffect(() => {
    sortTracks(sortBy);
  }, [sortBy]);
  return (
    <div>
      <Select
        onValueChange={(e) => {
          setSortBy(e);
        }}
      >
        <SelectTrigger className="w-[250px] mx-auto mt-6">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="ascending">Ascending (A to Z)</SelectItem>
            <SelectItem value="descending">Descending (Z to A)</SelectItem>
            <SelectItem value="new">Newest first</SelectItem>
            <SelectItem value="old">Oldest first</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <ul className="p-8 md:20 grid grid-cols-1 gap-x-6 gap-y-8 place-items-center lg:grid-cols-2 w-full">
        {filteredTracks.map((t) => (
          <li key={t.id} className="max-w-screen-md w-full">
            {t.problems.length > 0 ? (
              <div className="w-full" onClick={()=>navigateToTrack(t)}>
                <TrackCard track={t} />
              </div>
            ) : (
              <TrackCard track={t} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
