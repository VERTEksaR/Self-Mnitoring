from datetime import date, timedelta


MAX_BOX = 5
INTERVALS = {1: 1, 2: 3, 3: 7, 4: 14, 5: 30}  # коробка → через сколько дней повторять


def next_review(box: int, remembered: bool, today: date) -> tuple[int, date]:
    """Коробки Лейтнера: «помню» — на коробку выше (до 5), «не помню» — в 1-ю, повтор завтра."""
    new_box = min(box + 1, MAX_BOX) if remembered else 1
    return new_box, today + timedelta(days=INTERVALS[new_box])
