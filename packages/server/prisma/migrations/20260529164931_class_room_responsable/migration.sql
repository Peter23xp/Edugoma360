-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "titulaireId" TEXT,
    "maxStudents" INTEGER NOT NULL DEFAULT 45,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "classes_titulaireId_fkey" FOREIGN KEY ("titulaireId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "classes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_classes" ("id", "isActive", "maxStudents", "name", "schoolId", "sectionId", "titulaireId") SELECT "id", "isActive", "maxStudents", "name", "schoolId", "sectionId", "titulaireId" FROM "classes";
DROP TABLE "classes";
ALTER TABLE "new_classes" RENAME TO "classes";
CREATE UNIQUE INDEX "classes_schoolId_name_key" ON "classes"("schoolId", "name");
CREATE TABLE "new_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GOOD',
    "building" TEXT,
    "floor" TEXT,
    "assignedClassId" TEXT,
    "responsableId" TEXT,
    "equipments" TEXT NOT NULL DEFAULT '[]',
    "stateDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rooms_assignedClassId_fkey" FOREIGN KEY ("assignedClassId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rooms_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rooms" ("assignedClassId", "building", "capacity", "createdAt", "equipments", "floor", "id", "name", "schoolId", "stateDescription", "status", "type", "updatedAt") SELECT "assignedClassId", "building", "capacity", "createdAt", "equipments", "floor", "id", "name", "schoolId", "stateDescription", "status", "type", "updatedAt" FROM "rooms";
DROP TABLE "rooms";
ALTER TABLE "new_rooms" RENAME TO "rooms";
CREATE UNIQUE INDEX "rooms_assignedClassId_key" ON "rooms"("assignedClassId");
CREATE INDEX "rooms_schoolId_type_status_idx" ON "rooms"("schoolId", "type", "status");
CREATE INDEX "rooms_responsableId_idx" ON "rooms"("responsableId");
CREATE UNIQUE INDEX "rooms_schoolId_name_key" ON "rooms"("schoolId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

