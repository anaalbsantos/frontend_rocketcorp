import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3000";

export function useCycleReviewNotification() {
  const [isInReview, setIsInReview] = useState(false);

  useEffect(() => {
    async function fetchCycle() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsInReview(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setIsInReview(false);
          return;
        }

        const data = await response.json();

        const ciclo = data.ciclo_atual_ou_ultimo;
        if (!ciclo || !ciclo.reviewDate || !ciclo.endDate) {
          setIsInReview(false);
          return;
        }

        const now = new Date();
        const reviewDate = new Date(ciclo.reviewDate);
        const endDate = new Date(ciclo.endDate);

        setIsInReview(now >= reviewDate && now <= endDate);
      } catch {
        setIsInReview(false);
      }
    }

    fetchCycle();
  }, []);

  return isInReview;
}