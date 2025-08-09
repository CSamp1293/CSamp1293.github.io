from course import Course

def load_courses_from_file(filename):
    """
    Loads courses from a text file and stores them in a dictionary.

    Each line of the file should be formatted as:
    CourseID, CourseName, Prerequisite1, Prerequisite2, ...

    Args:
        filename (str): The path to the input text file.

    Returns:
        dict: A dictionary mapping course IDs to Course objects.
    """
    courses = {}
    try:
        with open(filename, 'r') as file:
            for line in file:
                parts = line.strip().split(',')
                course_id = parts[0].strip()
                name = parts[1].strip()
                # Parse prerequisites, if present
                prerequisites = [p.strip() for p in parts[2:]] if len(parts) > 2 else []
                # Create and store the Course object
                courses[course_id] = Course(course_id, name, prerequisites)
    except FileNotFoundError:
        print("File not found.")
    return courses

def print_all_courses(courses):
    """
    Prinats all courses in the dictionary in alphabetical order by ID.

    Args:
        courses (dict): Dictionary of Course objects.
    """
    for course_id in sorted(courses):
        course = courses[course_id]
        print(f"{course.id}: {course.name}")

def print_course_details(courses, course_id):
    """
    Prints the details of a specific course, including prerequisites.

    Args:
        courses (dict): Dictionary of Course objects.
        course_id (str): ID of the course to display.
    """
    course = courses.get(course_id)
    if course:
        print(f"\nCourse ID: {course.id}")
        print(f"Name: {course.name}")
        print("Prerequisites: ")
        if course.prerequisites:
            for p in course.prerequisites:
                print(f"- {p}")
        else:
            print("None")
    else:
        print("Course not found.")

def resolve_prerequisites(courses, course_id, visited=None):
    """
    Recursively resolves and returns all prerequisites for a given course.

    Args:
        courses (dict): Dictonary of Course objects.
        course_id (str): Course ID to trace prerequisites for.
        visited (set, optional): Tracks visited courses to avoid infinite loops.

    Returns:
        list: A list of prerequisite course IDs in dependency order.
    """
    if visited is None:
        visited = set()
    if course_id in visited:
        return []   # Prevent circular dependency
    visited.add(course_id)
    course = courses.get(course_id)
    if not course:
        return []
    prereqs = []
    for prereq in course.prerequisites:
        prereqs.append(prereq)
        # Recursively resolve each prerequisite
        prereqs.extend(resolve_prerequisites(courses, prereq, visited))
    return prereqs

def main():
    """
    Main function to drive the course scheduler menu system.
    Allows listing, searching, and tracing prerequisites for courses.
    """
    filename = input("Enter path to course file (i.e., courses.txt): ").strip()
    courses = load_courses_from_file(filename)

    while True:
        print("\nMenu:")
        print("1. List all courses")
        print("2. Search for a course")
        print("3. View full prerequisite chain")
        print("4. Exit")
        choice = input("Select an option: ")

        if choice == "1":
            print_all_courses(courses)
        elif choice == "2":
            course_id = input("Enter course ID: ").strip()
            print_course_details(courses, course_id)
        elif choice == "3":
            course_id = input("Enter course ID to trace prerequisites: ").strip()
            chain = resolve_prerequisites(courses, course_id)
            if chain:
                print(f"Prerequisite chain for {course_id}: {', '.join(chain)}")
            else:
                print("No prerequisites or course not found.")
        elif choice == "4":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()