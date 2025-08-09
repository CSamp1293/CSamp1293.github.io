class Course:
    """
    Represents a course with an ID, name, and list of prerequisites.
    """ 
    def __init__(self, id, name, prerequisites=None):
        """
        Initializes a Course object.

        Args:
            id (str): The course ID (i.e., "CS101").
            name (str): The name of the course.
            prerequisite (list, optional): List of course IDs that are prerequisites.
        """
        self.id = id
        self.name = name
        self.prerequisites = prerequisites if prerequisites else []